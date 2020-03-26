import gql from 'graphql-tag';
import { DocumentNode } from 'graphql';

import { COLOR } from './schema';

export namespace UpdateCostumeColorMutation {
  export interface Arguments {
    color: COLOR;
  }
  export type UpdateCostumeColor = boolean;
}
export interface UpdateCostumeColorMutation {
  updateCostumeColor: UpdateCostumeColorMutation.UpdateCostumeColor;
}
export const updateCostumeColorMutation: DocumentNode = gql(`mutation updateCostumeColor($color: COLOR!) {
  updateCostumeColor(color: $color)
}`);
