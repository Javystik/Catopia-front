import { ChapterDTO } from './chapter';
import { UserDTO } from './user';

export const fullNovelDTO = {
    id: null,
    titleUk: '',
    titleEn: '',
    altTitles: [],
    description: '',
    author: {},
    coverUrl: '',
    bannerUrl: '',
    releaseYear: null,
    type: '',
    status: '',
    ageRating: '',
    originalUrl: '',
    chapterCount: null,
    createdAt: '',
    updatedAt: '',
    chapters: new Set(),
    tags: new Set(),
    genres: new Set(),
};
