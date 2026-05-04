import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonSearchbar, IonContent, IonList, IonItem, IonCheckbox } from "@ionic/angular/standalone";

export interface Item {
  text: string;
  value: string;
}

@Component({
  selector: 'app-typeahead',
  templateUrl: './typeahead.component.html',
  styleUrls: ['./typeahead.component.scss'],
  imports: [IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonSearchbar, IonContent, IonList, IonItem, IonCheckbox],
})
export class TypeaheadComponent  implements OnInit {
  @Input() items: any[] = [];
  @Input() itemType: 'Speaker' | 'Room' = 'Speaker';
  @Input() selectedItems: string[] = [];
  @Input() title = 'Select Items';

  @Output() selectionCancel = new EventEmitter<void>();
  @Output() selectionChange = new EventEmitter<string[]>();

  filteredItems: any[] = [];
  workingSelectedValues: string[] = [];

  ngOnInit() {
    this.filteredItems = [...this.items];
    this.workingSelectedValues = [...this.selectedItems];
  }

  cancelChanges() {
    this.selectionCancel.emit();
  }

  confirmChanges() {
    this.selectionChange.emit(this.workingSelectedValues);
  }

  searchbarInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.filterList(inputElement.value);
  }

  /**
   * Update the rendered view with
   * the provided search query. If no
   * query is provided, all data
   * will be rendered.
   */
  filterList(searchQuery: string | undefined) {
    /**
     * If no search query is defined,
     * return all options.
     */
    if (searchQuery === undefined || searchQuery.trim() === '') {
      this.filteredItems = [...this.items];
    } else {
      /**
       * Otherwise, normalize the search
       * query and check to see which items
       * contain the search query as a substring.
       */
      const normalizedQuery = searchQuery.toLowerCase();
      switch (this.itemType) {
        case 'Speaker':
          this.filteredItems = this.items.filter((item) => item.firstname.toLowerCase().includes(normalizedQuery));
          break;
        default:
          this.filteredItems = this.items.filter((item) => item.text.toLowerCase().includes(normalizedQuery));
          break;
      }
    }
  }

  isChecked(value: string): boolean {
    return this.workingSelectedValues.includes(value);
  }

  checkboxChange(event: CustomEvent<{ checked: boolean; value: string }>) {
    const { checked, value } = event.detail;

    if (checked) {
      this.workingSelectedValues = [...this.workingSelectedValues, value];
    } else {
      this.workingSelectedValues = this.workingSelectedValues.filter((item) => item !== value);
    }
  }

}
