// Auth.d.ts

import Guard from "./Guard";

type GuardInstance = Guard;

declare class Auth {
  private static defaultGuard: string;

  static attempt(credentials: Record<string, any>, remember?: boolean): any;
  static login(user: any, remember?: boolean): any;
  static loginUsingId(id: any, remember?: boolean): any;
  static once(credentials: Record<string, any>): any;
  static onceUsingId(id: any): any;
  static logout(): any;
  static check(): boolean;
  static guest(): boolean;
  static id(): any;
  static user(): any;
  static validate(credentials: Record<string, any>): boolean;
  static hasUser(): boolean;
  static setUser(user: any): void;
  static shouldUse(guardName: string): void;
  static guard(name?: string | null): GuardInstance;
}

export = Auth;
