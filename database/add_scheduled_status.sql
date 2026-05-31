ALTER TABLE tbl_leads
MODIFY COLUMN status ENUM(
    'new',
    'scheduled',
    'convrted',
    'contacted',
    'qualified',
    'proposal',
    'closed',
    'lost'
) NOT NULL DEFAULT 'new';

