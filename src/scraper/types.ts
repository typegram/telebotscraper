export type Category =
    | 'core'
    | 'game'
    | 'inline'
    | 'passport'
    | 'payments'
    | 'stickers'
    | 'unknown';

export interface Schema {
    type: 'schema';
    name: string;
    description: string;
    category: Category;
    fields: {
        name: string;
        description: string;
        type: FieldType;
        optional: boolean;
    }[];
}

export interface Method {
    type: 'method';
    name: string;
    description: string;
    category: Category;
    fields: {
        name: string;
        description: string;
        type: FieldType;
        optional: boolean;
    }[];
    returnType: FieldType;
}

export interface Result {
    version: string;
    methods: Method[];
    schemas: Schema[];
}

export type SimpleType =
    | {
          type: 'primitive';
          value: 'string' | 'integer' | 'float' | 'boolean' | 'true' | 'false';
      }
    | { type: 'name'; value: string };

export type UnknownType = { type: 'unknown' };

export type FieldType =
    | SimpleType
    | UnknownType
    | { type: 'array'; component: FieldType }
    | { type: 'or'; components: FieldType[] };
