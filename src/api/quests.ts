import { supabase } from '../supabaseClient';
import { Quest } from '../components/QuestCard';

// Interface matching our tasks table schema
interface QuestDB {
  id: string;
  title: string;
  description: string;
  reward_points: number;
  frequency: string; // 'daily', 'weekly', or 'one-off'
  status: string; // 'assigned', 'pending approval', 'completed', or 'rejected'
  assigned_child_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Mapping function: converts a QuestDB record to our front-end Quest type
export function mapQuestDBToQuest(q: QuestDB): Quest {
  let mappedStatus: Quest['status'] = 'assigned';
  switch(q.status) {
    case 'assigned':
      mappedStatus = 'assigned';
      break;
    case 'pending approval':
      mappedStatus = 'pending';
      break;
    case 'completed':
      mappedStatus = 'completed';
      break;
    case 'rejected':
      mappedStatus = 'failed';
      break;
    default:
      mappedStatus = 'assigned';
  }

  return {
    id: q.id,
    title: q.title,
    description: q.description,
    points: q.reward_points,
    frequency: q.frequency,
    status: mappedStatus
  };
}

// Fetch quests from the 'tasks' table
export async function fetchQuests(): Promise<{ data: Quest[] | null, error: Error | null }> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*');

  if(error) {
    return { data: null, error };
  }

  const quests = (data as QuestDB[]).map(mapQuestDBToQuest);
  return { data: quests, error: null };
}

// Update a quest's status in the 'tasks' table
export async function updateQuestStatus(questId: string, newStatus: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('tasks')
    .update({ status: newStatus })
    .eq('id', questId);

  return { error };
} 