CREATE TABLE IF NOT EXISTS Annotators (
    A_id INTEGER,
    A_name TEXT,

    PRIMARY KEY (A_id)
);

CREATE TABLE IF NOT EXISTS Images (
    I_file TEXT,
    Split TEXT DEFAULT '' CHECK (Split IN ('Train', 'Test', 'Prediction', '')),

    Annotator INTEGER,
    Annotated_at DATE,

    Filmed_location TEXT,
    Filmed_at DATE,
    Source TEXT,

    PRIMARY KEY (I_file),
    FOREIGN KEY (Annotator) REFERENCES Annotators (
        A_id
    ) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Classes (
    C_id INTEGER,
    English_name TEXT,
    Chinese_name TEXT,

    PRIMARY KEY (C_id)
);

CREATE TABLE IF NOT EXISTS Labels (
    Height REAL CHECK (Height BETWEEN 0.0 AND 1.0),
    Width REAL CHECK (Width BETWEEN 0.0 AND 1.0),
    Center_x REAL CHECK (Center_x BETWEEN 0.0 AND 1.0),
    Center_y REAL CHECK (Center_y BETWEEN 0.0 AND 1.0),
    Image TEXT NOT NULL,
    L_class INTEGER NOT NULL,

    PRIMARY KEY (Height, Width, Center_x, Center_y, Image, L_class),
    FOREIGN KEY (L_class) REFERENCES Classes (
        C_id
    ) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (Image) REFERENCES Images (
        I_file
    ) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE OR REPLACE VIEW Work AS
SELECT
    A.A_name,
    A.A_id,

    I.I_file,
    I.Annotated_at,

    L.L_class,
    L.Height,
    L.Width,
    L.Center_x,
    L.Center_y
FROM Images AS I
INNER JOIN Annotators AS A ON I.Annotator = A.A_id
INNER JOIN Labels AS L ON I.I_file = L.Image;

CREATE OR REPLACE VIEW Work_count AS
WITH W AS (
    SELECT
        Work.A_id,
        count(Work.I_file) AS File_count,
        count(*) AS Label_count
    FROM Work
    GROUP BY Work.A_id
)

SELECT
    A.A_id,
    A.A_name,
    W.File_count,
    W.Label_count
FROM Annotators AS A INNER JOIN W ON A.A_id = W.A_id;
