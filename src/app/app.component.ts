import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { JsonDataService } from './json-data.service';

export interface TreeNode {
  id: string;
  name: string;
  children: TreeNode[];
}



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
	data: TreeNode[] = []

  constructor(
    private readonly jsonDataService: JsonDataService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.jsonDataService.getData().subscribe((data: TreeNode[]) => {
      console.log(data);
      this.data = data
      this.cdr.markForCheck();
    });
  }

  trackById(index: number, item: TreeNode): string {
    return item.id;
  }
}

