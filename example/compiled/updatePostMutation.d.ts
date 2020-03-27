import { DocumentNode } from 'graphql';
import { DateTime } from './schema';
export declare namespace UpdatePostMutation {
    interface Arguments {
        id: any;
        text: string;
    }
    interface updatePost {
        updatedAt: updatePost.updatedAt;
    }
    namespace updatePost {
        type updatedAt = DateTime | null;
    }
}
export interface UpdatePostMutation {
    updatePost: UpdatePostMutation.updatePost;
}
export declare const UpdatePostMutation: DocumentNode;
