import { Component, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { DataService } from "../services/data.service";
import { RedditService } from "../services/reddit.service";
import { FormControl, FormGroup } from "@angular/forms";
import { Plugins } from "@capacitor/core";

import { SettingsPage } from "../settings/settings.page";
import { debounceTime } from "rxjs/operators";
import { distinctUntilChanged } from "rxjs/operators";

const { Browser, Keyboard } = Plugins;

@Component({
  selector: "app-home",
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss"]
})
export class HomePage implements OnInit {
  public subredditForm: FormGroup;

  constructor(
    private dataService: DataService,
    public redditService: RedditService,
    private modalCtrl: ModalController
  ) {
    this.subredditForm = new FormGroup({
      subredditControl: new FormControl("")
    });
  }

  ngOnInit() {
    this.redditService.load();

    this.subredditForm
      .get("subredditControl")
      .valueChanges.pipe(
        debounceTime(1500),
        distinctUntilChanged()
      )
      .subscribe((subreddit: any) => {
        if (subreddit.length > 0) {
          this.redditService.changeSubreddit(subreddit);
          Keyboard.hide().catch(err => {
            console.warn(err);
          });
        }
      });
  }

  showComments(post): void {
    Browser.open({
      toolbarColor: '#fff',
      url: 'http://reddit.com' + post.data.permalink,

      windowName: '_system'
    });
  }

  openSettings(): void {
    this.modalCtrl.create({
      component: SettingsPage
    })
      .then(modal => {
        modal.onDidDismiss().then(() => {
          this.redditService.resetPosts();
        });
        modal.present();
      });
  }

  playVideo(e, post): void {
    console.log(e);
    let video = e.target;
    if (video.paused) {
      video.play();
      video.addEventListener("playing", e => {
        console.log("playing video");
      });
    } else {
      video.pause();
    }
  }

  loadMore(): void {
    this.redditService.nextPage();
  }

}
