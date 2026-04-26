import { Injectable } from '@angular/core';

interface TableSpec {
  name: string;
  idbSpec : {keyPath: string}
  indexes?: {path: string, type: string, unique?: boolean}[]

}

const LOG_TAG = 'storage.servce';

const HARD_TTL = 1000 * 30
const INDEXED_DB_VERSION = 1;
const IDB_NAME = 'ConfApp';

const TABLE_SPECS: TableSpec[] = [
  { 
    name: 'eventUsers',
    idbSpec : {keyPath: "email"},
  },
  {
    name: 'leads',
    idbSpec : {keyPath: "id"},
  },
  {
    name: 'sponsors',
    idbSpec : {keyPath: "name"},
    indexes: [
      // {path: 'name', type: 'string', unique: true}
    ]
  }
]

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private db!: IDBDatabase;

  constructor() {
    this.init();
  }

  private async init() {
    console.log(LOG_TAG, 'Initializing storage service');
    const dbReq = indexedDB.open(IDB_NAME, INDEXED_DB_VERSION);

    dbReq.onsuccess = (event:any) => {
      this.db = event.target.result;
      this.db.onerror = (event:any) => {
        console.error(`Database error: ${event.target.errorCode}`, event);
      };
      // return;
    };


    dbReq.onupgradeneeded = (event) => {
      console.log('dbReq.onupgradeneeded');
      const db = dbReq.result;

      if (event.oldVersion === 0 && event.newVersion) {
        // new install
        for (const spec of TABLE_SPECS) {
          console.log("Creating table", spec.name);
          const table = db.createObjectStore(spec.name, spec.idbSpec);
          if (spec.indexes) {
            spec.indexes.forEach(idx => {
              table.createIndex(idx.path, idx.path, {unique: idx.unique});
            })
          }
        }
        return
      } else {
        console.warn(`Unsupported database upgrade from version ${event.oldVersion} to ${event.newVersion}`);
        return;
      }

    }
  }

  public async clearTable(tableName: string): Promise<any> {
    const transaction = this.db.transaction([tableName], "readwrite");
    const objectStore = transaction.objectStore(tableName);
    objectStore.clear();
    return;
  }

  public async get(soupName: string, key:any, index = "Id", order:string = 'ascending', usePrimary: boolean = false ):Promise<any[]> {
    console.log(LOG_TAG, 'get', soupName, key, index, order, usePrimary);

    await this.waitForDB();
    return new Promise(async (resolve, reject) => {
      const transaction = this.db.transaction([soupName]);
      const objectStore = transaction.objectStore(soupName);
      let cursorToOpen;
      let entries:any[] = [];
      const direction = (order === 'ascending') ? 'next' : 'prev';
    
      try { // See if there is an index defined, if not default to the primary
        const myIndex = objectStore.index(index);
        cursorToOpen = myIndex.openCursor(key, direction);
      }catch (e) {
        cursorToOpen = objectStore.openCursor(key, direction);
      }

      cursorToOpen.onsuccess = (event:any) => {
        const cursor = event.target.result;
        if(cursor) {
          entries.push(cursor.value);
          cursor.continue();
        } else {
          resolve(entries);
        }
      }
    });
  }


  public async getAll(soupName: string, key:string|null  = null, index:string|null = null, direction:string = 'next', usePrimary: boolean = false ):Promise<any[]> {
    // TODO Multi-org
    console.log('getAll', soupName, key, index, direction, usePrimary);
    await this.waitForDB();
    console.log('DB is ready, proceeding with getAll');
    return new Promise(async (resolve, reject) => {

    const transaction = this.db.transaction([soupName]);
    const objectStore = transaction.objectStore(soupName);
    if (key) {
      const myIndex = objectStore.index(index ?? key);
      let entries:any[] = [];
      myIndex.openCursor(key, direction as IDBCursorDirection).onsuccess = (event:any) => {
        const cursor = event.target.result;
        if(cursor) {
          entries.push(cursor.value);
          cursor.continue();
        } else {
          resolve(entries);
        }
      }
    } else {
      objectStore.getAll().onsuccess = (event:any) => {
        resolve(event.target.result);
    };   
    }
    });
  }

  public shouldRefresh(
    lastFetchedTimeOrToken: number | string = 0,
    cacheTTL:number,
    hardTTL :number = HARD_TTL,
    forceRefresh:boolean = false): boolean {
  
      const lastFetchedTime = (typeof(lastFetchedTimeOrToken) === "string") ?
        Number(localStorage.getItem(lastFetchedTimeOrToken) ?? '0'):
        lastFetchedTimeOrToken;
      const timeNow = Date.now();
      const cacheExpired = timeNow > (lastFetchedTime + cacheTTL);
      const refresh = (forceRefresh || cacheExpired) && 
        timeNow > (lastFetchedTime + hardTTL);
      return refresh;
  }

  public updateFetchedTime(token: string) {
    localStorage.setItem(token, Date.now().toString());
  }

  public async upsert(soupName: string, entries:any[], idField:string = 'id', usePrimary: boolean = false):Promise<any> {
    console.log(LOG_TAG, "upsert", soupName, entries, usePrimary);
    await this.waitForDB();
    return new Promise(async (resolve, reject) => {

    setTimeout(() => {
      // let db = (usePrimary) ? this.dbPrimary : this.db; 
      // console.log("db", db);
      const transaction = this.db.transaction([soupName], "readwrite");
      const objectStore = transaction.objectStore(soupName);
      entries.forEach(row => {
        // const index = objectStore.index(idField);
        objectStore.get(row[idField]).onsuccess = (event:any) => {
          let request;
          const existingRec = event.target.result;
          if (existingRec) {
            request = objectStore.put(row);
          } else {
            request = objectStore.add(row);
          }
          request.onsuccess = (event:any) => {
            console.log("IDB upsert res", event.target.result);
            resolve(event.target.result);
          };
          request.onerror = (event:any) => {
            console.error("IDB upsert error", event);
            reject(event);
          }
        }
      });
      

      transaction.onerror = (event:any) => {
        console.warn("IDB upsert error", event);
        reject(event)
      };

      return;
    } , 100);     
    });  
  }
  
  /**
   * We just wait to make sure our IDB is ready for operations
   * @param attempt - to prevent infinite loop in case of some weird IDB issue, we will give up after 10 attempts
   * @returns 
   */
  private async waitForDB(attempt: number = 1): Promise<void> {
    console.log(LOG_TAG, `waitForDB attempt ${attempt}`, this.db);
    if (attempt > 10) {
      console.error(LOG_TAG, 'waitForDB, max attempts reached, giving up');
      return;
    }
    if (this.db) {
      console.log(LOG_TAG, 'waitForDB, returning');
      return;
    } else {
      // const checkDbInterval = setInterval(() => {
        return new Promise(resolve => setTimeout(() => {
          if (this.db) {
            // clearInterval(checkDbInterval);
            console.log(LOG_TAG, 'DB is now available');
            resolve();
          } else {
            resolve(this.waitForDB(attempt + 1));
          }
        }, 100));
    }
  }


}
