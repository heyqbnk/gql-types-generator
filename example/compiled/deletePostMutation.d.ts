import { DocumentNode } from 'graphql';
export declare namespace DeletePostMutation {
    interface Arguments {
        id: any;
    }
    type DeletePost = boolean;
}
export interface DeletePostMutation {
    deletePost: DeletePostMutation.DeletePost;
}
export declare const deletePostMutation: DocumentNode;
