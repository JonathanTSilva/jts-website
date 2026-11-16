import { careerDataSchema } from './schema';
import { person } from './person';
import { employers, positions } from './experience';
import { education } from './education';
import { projects } from './projects';
import { publications } from './publications';
import { skillGroups } from './skills';

export const career = careerDataSchema.parse({ person, employers, positions, education, projects, publications, skillGroups });
