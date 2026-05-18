'use client';

import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';

interface QuestionCardProps {
  question: string;
  category: 'clinical' | 'behavioral' | 'salary' | 'multiple_choice';
  questionNumber: number;
  totalQuestions: number;
}

const categoryLabels = {
  clinical: 'Clinical Scenario',
  behavioral: 'Behavioral',
  salary: 'Salary Prep',
  multiple_choice: 'Quick Fire',
};

export default function QuestionCard({
  question,
  category,
  questionNumber,
  totalQuestions,
}: QuestionCardProps) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <Badge variant={category === 'multiple_choice' ? 'teal' : 'outline'}>
          {categoryLabels[category]}
        </Badge>
        <span className="text-sm text-body-text">
          Question {questionNumber} of {totalQuestions}
        </span>
      </div>
      <p className="text-lg font-medium leading-relaxed text-dark-text">
        {question}
      </p>
    </Card>
  );
}
