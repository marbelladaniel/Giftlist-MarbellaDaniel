import { Component } from '@angular/core';
import { ModalController } from "@ionic/angular";
import { RedditService } from "../services/reddit.service";
import { DataService } from "../services/data.service";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.page.html",
  styleUrls: ["./settings.page.scss"],
})
export class SettingsPage {

  constructor(
    public redditService: RedditService,
    private dataService: DataService,
    private modalCtrl: ModalController
  ) { }

  save(): void {
    this.dataService.save({
      perPage: this.redditService.settings.perPage,
      sort: this.redditService.settings.sort,
      subreddit: this.redditService.settings.subreddit
    });

    this.close();
  }

  close(): void {
    this.modalCtrl.dismiss();
  }

}
