import { DocumentNode } from 'graphql';
import { DateTime } from './schema';
export declare namespace UpdatePostMutation {
    interface Arguments {
        id: any;
        text: string;
    }
    interface UpdatePost {
        updatedAt: UpdatePost.UpdatedAt;
    }
    namespace UpdatePost {
        type UpdatedAt = DateTime | null;
    }
}
export interface UpdatePostMutation {
    updatePost: UpdatePostMutation.UpdatePost;
}
export declare const updatePostMutation: DocumentNode;
