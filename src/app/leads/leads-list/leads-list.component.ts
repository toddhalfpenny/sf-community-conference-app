import { Component, Input, OnInit } from '@angular/core';
import { RouterLink} from '@angular/router'
import { IonList, IonItem, IonBadge, IonLabel } from "@ionic/angular/standalone";
import { type Lead } from "../lead.model";

@Component({
  selector: 'app-leads-list',
  templateUrl: './leads-list.component.html',
  styleUrls: ['./leads-list.component.scss'],
  standalone: true,
  imports: [IonList, IonItem, IonBadge, IonLabel, RouterLink],
})
export class LeadsListComponent  implements OnInit {
  @Input({required: true}) leads: Lead[] = [];
  @Input() searchTerm: string = '';

  private readonly routerLink = RouterLink;

  constructor() { }

  ngOnInit() {}

}
