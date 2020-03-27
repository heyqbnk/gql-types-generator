import { DocumentNode } from 'graphql';
import { DateTime } from './schema';
export declare namespace UpdatePostMutation {
    interface Arguments {
        id: any;
        text: string;
    }
    type updatePost = {
        updatedAt: updatePost.updatedAt;
    } | null;
    namespace updatePost {
        type updatedAt = DateTime | null;
    }
}
export interface UpdatePostMutation {
    updatePost: UpdatePostMutation.updatePost;
}
export declare const updatePostMutation: DocumentNode;
