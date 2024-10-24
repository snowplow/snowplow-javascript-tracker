export type RequiredExcept<T, E extends keyof T> = {
  [P in Exclude<keyof T, E>]-?: Exclude<T[P], undefined>;
} & {
  [P in E]?: T[P];
};

export type OneOrMany<T> = T | T[];

export type AttributeList = {
  source: string;
  attribute: string;
  value: string;
}[];
