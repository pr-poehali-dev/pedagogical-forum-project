-- Add file_url and file_name columns to articles table
ALTER TABLE t_p90702635_pedagogical_forum_pr.articles 
ADD COLUMN file_url TEXT,
ADD COLUMN file_name VARCHAR(255),
ADD COLUMN file_type VARCHAR(50);