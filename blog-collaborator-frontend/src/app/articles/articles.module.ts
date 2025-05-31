import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ArticlesRoutingModule } from './articles-routing.module';
import { ArticleListComponent } from './components/article-list/article-list.component';
import { ArticleFormComponent } from './components/article-form/article-form.component';

@NgModule({
  imports: [
    ArticlesRoutingModule,
    CommonModule,
    FormsModule,
    ArticleListComponent,
    ArticleFormComponent,
  ],
})
export class ArticlesModule {}
