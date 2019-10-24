import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from './data.service';

import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class RedditService {

  public settings = {
    perPage: 10,
    subreddit: 'gifs',
    sort: '/hot'
  };
  public posts: any[] = [];

  public loading: boolean = false;
  private page: number = 1;
  private after: string;
  private moreCount: number = 0;

  constructor(private http: HttpClient, private dataService: DataService) {

  }

  load(): void {
    this.dataService.getData().then(settings => {
      if (settings != null) {
        this.settings = settings;
      }
      this.fetchData();
    });
  }

  fetchData(): void {
    let url = "https://www.reddit.com/r/" + this.settings.subreddit + this.settings.sort + "/.json?limit=100";
    if (this.after) {
      url += "&after=" + this.after;
    }
    this.loading = true;

    this.http
      .get(url)
      .pipe(
        map((res: any) => {
          console.log(res);

          let response = res.data.children;
          let validPosts = 0;

          response = response.filter(post => {
            if (validPosts >= this.settings.perPage) {
              return false;
            }
            if (post.data.url.indexOf(".gifv") > -1 ||
              post.data.url.indexOf(".webm") > -1) {
              post.data.url = post.data.url.replace(".gifv", ".mp4");
              post.data.url = post.data.url.replace(".webm", ".mp4");

              if (typeof post.data.preview != "undefined") {
                post.data.snapshot = post.data.preview.images[0].source.url.replace(/&amp;/g, "&");

                if (post.data.snapshot == "underfined") {
                  post.data.snapshot = "";
                }
              } else {
                post.data.snapshot = "";
              }
              validPosts++;

              return true;
            } else {
              return false;
            }
          });
          if (validPosts >= this.settings.perPage) {
            this.after = response[this.settings.perPage - 1].data.name;
          } else if (res.data.children.length > 0) {
            this.after = res.data.children[res.data.children.length - 1].data.name;
            console.log(this.after);
          }
          return response;
        })
      )
      .subscribe(
        (data: any) => {
          console.log(data);
          this.posts.push(...data);
          if (this.moreCount > 50) {
            console.log("giving up");
            this.moreCount = 0;
            this.loading = false;
          } else {
            if (this.posts.length < this.settings.perPage * this.page) {
              this.fetchData();
              this.moreCount++;
            } else {
              this.loading = false;
              this.moreCount = 0;
            }
          }
        },
        err => {
          console.log(err);
          console.log("Cant find data");
        }
      );
  }

  nextPage(): void {
    this.page++;
    this.fetchData();
  }

  resetPosts(): void {
    this.page = 1;
    this.posts = [];
    this.after = null;
    this.fetchData();
  }

  changeSubreddit(subreddit): void {
    this.settings.subreddit = subreddit;
    this.resetPosts();
  }

}
