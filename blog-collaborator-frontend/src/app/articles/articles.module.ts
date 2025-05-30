import { NgModule } from '@angular/core';

import { ArticlesRoutingModule } from './articles-routing.module';
import { ArticleListComponent } from './components/article-list/article-list.component';
import { ArticleFormComponent } from './components/article-form/article-form.component';

@NgModule({
  imports: [ArticlesRoutingModule, ArticleListComponent, ArticleFormComponent],
})
export class ArticlesModule {}
