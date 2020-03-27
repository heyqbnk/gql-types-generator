import { DocumentNode } from 'graphql';
export declare namespace DeletePostMutation {
    interface Arguments {
        id: any;
    }
    type deletePost = boolean;
}
export interface DeletePostMutation {
    deletePost: DeletePostMutation.deletePost;
}
export declare const DeletePostMutation: DocumentNode;
