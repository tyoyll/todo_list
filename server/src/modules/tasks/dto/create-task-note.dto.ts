import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 创建任务笔记 DTO
 */
export class CreateTaskNoteDto {
  @ApiProperty({
    description: '笔记内容',
    example: '今天完成了需求分析，明天开始编码',
    minLength: 1,
    maxLength: 5000,
  })
  @IsString()
  @MinLength(1, { message: '笔记内容不能为空' })
  @MaxLength(5000, { message: '笔记内容最多5000个字符' })
  content: string;
}

