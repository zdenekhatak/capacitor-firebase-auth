import {registerWebPlugin, WebPlugin} from '@capacitor/core';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import {AccessToken, CapacitorFirebaseAuthPlugin, SignInResult} from './definitions';
import {facebookSignInWeb} from './providers/facebook.provider';
import {googleSignInWeb} from './providers/google.provider';
import {phoneSignInWeb} from './providers/phone.provider';
import {twitterSignInWeb} from './providers/twitter.provider';

declare var FB: any;

export class CapacitorFirebaseAuthWeb extends WebPlugin implements CapacitorFirebaseAuthPlugin {
  constructor() {
    super({
      name: 'CapacitorFirebaseAuth',
      platforms: ['web']
    });
  }

  async signIn(options: {providerId: string;}): Promise<SignInResult> {
      const googleProvider = new firebase.auth.GoogleAuthProvider().providerId;
      const facebookProvider = new firebase.auth.FacebookAuthProvider().providerId;
      const twitterProvider = new firebase.auth.TwitterAuthProvider().providerId;
      const phoneProvider = new firebase.auth.PhoneAuthProvider().providerId;
      switch (options.providerId) {
          case googleProvider:
              return googleSignInWeb(options);
          case twitterProvider:
              return twitterSignInWeb(options);
          case facebookProvider:
              return facebookSignInWeb(options);
          case phoneProvider:
              return phoneSignInWeb(options);
      }

	  return Promise.reject(`The '${options.providerId}' provider was not supported`);
  }

  async signOut(_: {}): Promise<void> {
      return firebase.auth().signOut()
  }

  async getFacebookCurrentToken(appId: string) {
    return new Promise((resolve, reject) => {
      this.addFacebookSDK(appId).then(_ => FB.getLoginStatus((response: any) => {
        if (response.status === 'connected') {
          return resolve({accessToken: response.authResponse.accessToken});
        }
        return reject('Not logged in');
      }));
    }) as Promise<AccessToken>;
  }

  private addFacebookSDK(appId: string): Promise<void> {
    return new Promise((resolve, _) => {
      this.loadScript(appId,
        `https://connect.facebook.net/en_US/sdk.js`,
        () => {
         FB.init({
            appId,
            autoLogAppEvents: true,
            cookie: true,
            xfbml: true,
            version: 'v8.0',
          });

          resolve();
        });
    });
  }

  private loadScript(id: string, src: string, onload: any, async = true): void {
    if (document.getElementById(id)) { return; }

    const signInJS = document.createElement('script');
    signInJS.async = async;
    signInJS.src = src;
    signInJS.onload = onload;
    document.head.appendChild(signInJS);
  }
}

const CapacitorFirebaseAuth = new CapacitorFirebaseAuthWeb();
export { CapacitorFirebaseAuth };

// Register as a web plugin
registerWebPlugin(CapacitorFirebaseAuth);
