import { TagDTO } from './tag';
import { GenreDTO } from './genre';

export const detailNovelDTO = {
    id: null,
    titleUk: '',
    titleEn: '',
    status: '',
    releaseYear: null,
    chapterCount: null,
    description: '',
    tags: new Set(),
    genres: new Set(),
};
