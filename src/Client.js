// @flow
import locatePath from "locate-path";
import Activities from "./endpoints/Activities";
import Assets from "./endpoints/Assets";
import BaseEndpoint from "./endpoints/BaseEndpoint";
import Branches from "./endpoints/Branches";
import Changesets from "./endpoints/Changesets";
import Collections from "./endpoints/Collections";
import Comments from "./endpoints/Comments";
import Data from "./endpoints/Data";
import Commits from "./endpoints/Commits";
import Files from "./endpoints/Files";
import Layers from "./endpoints/Layers";
import Notifications from "./endpoints/Notifications";
import Organizations from "./endpoints/Organizations";
import Pages from "./endpoints/Pages";
import Previews from "./endpoints/Previews";
import Projects from "./endpoints/Projects";
import Shares from "./endpoints/Shares";
import Users from "./endpoints/Users";
import type { CommandOptions } from "./types";

export default class Client {
  activities: Activities;
  assets: Assets;
  branches: Branches;
  changesets: Changesets;
  collections: Collections;
  comments: Comments;
  commits: Commits;
  data: Data;
  files: Files;
  layers: Layers;
  notifications: Notifications;
  organizations: Organizations;
  pages: Pages;
  previews: Previews;
  projects: Projects;
  shares: Shares;
  users: Users;

  constructor(options: $Shape<CommandOptions> = {}) {
    const cliPathDefault =
      process.env.ABSTRACT_CLI_PATH ||
      locatePath.sync([
        // Relative to cwd
        "abstract-cli",
        // Relative to node_modules in cwd
        "node_modules/@elasticprojects/abstract-cli/bin/abstract-cli",
        // macOS App
        "/Applications/Abstract.app/Contents/Resources/app.asar.unpacked/node_modules/@elasticprojects/abstract-cli/bin/abstract-cli"
      ]);

    options = {
      accessToken: process.env.ABSTRACT_TOKEN,
      apiUrl: "https://api.goabstract.com",
      cliPath: cliPathDefault,
      previewsUrl: "https://previews.goabstract.com",
      transportMode: "auto",
      ...options
    };

    this.activities = new Activities(options, this);
    this.assets = new Assets(options, this);
    this.branches = new Branches(options, this);
    this.changesets = new Changesets(options, this);
    this.collections = new Collections(options, this);
    this.comments = new Comments(options, this);
    this.commits = new Commits(options, this);
    this.data = new Data(options, this);
    this.files = new Files(options, this);
    this.layers = new Layers(options, this);
    this.notifications = new Notifications(options, this);
    this.organizations = new Organizations(options, this);
    this.pages = new Pages(options, this);
    this.previews = new Previews(options, this);
    this.projects = new Projects(options, this);
    this.shares = new Shares(options, this);
    this.users = new Users(options, this);

    return new Proxy(this, {
      get(target: Object, endpoint: string) {
        if (typeof target[endpoint] === "object" && target[endpoint]) {
          return new Proxy(target[endpoint], {
            get(target: Object, key: string) {
              if (
                typeof target[key] === "function" &&
                !BaseEndpoint.prototype.hasOwnProperty(key)
              ) {
                target.lastCalledEndpoint = `${endpoint}.${key}`;
              }
              return target[key];
            }
          });
        }
        return target[endpoint];
      }
    });
  }
}