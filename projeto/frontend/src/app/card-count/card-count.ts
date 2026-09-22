import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { KanbanStateService } from '../kanban-state.service';

@Component({
  imports: [AsyncPipe],
  selector: 'app-card-count',
  templateUrl: './card-count.html',
})
export class CardCountComponent {
  private state = inject(KanbanStateService);
  cards$ = this.state.cards$;
}