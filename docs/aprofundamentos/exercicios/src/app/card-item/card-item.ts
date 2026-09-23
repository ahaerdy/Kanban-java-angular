import { Component, Input } from '@angular/core';
import { Card } from '../models/card';

@Component({
  imports: [],
  selector: 'app-card-item',
  styleUrl: './card-item.scss',
  templateUrl: './card-item.html',
})
export class CardItemComponent {
  @Input({ required: true }) card!: Card;
}