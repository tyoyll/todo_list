import { IsString, MaxLength, MinLength } from 'class-validator';

/**
 * 创建任务笔记 DTO
 */
export class CreateTaskNoteDto {
  @IsString()
  @MinLength(1, { message: '笔记内容不能为空' })
  @MaxLength(5000, { message: '笔记内容最多5000个字符' })
  content: string;
}

