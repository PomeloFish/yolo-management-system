-- Table: Annotators
CREATE TABLE IF NOT EXISTS Annotators (
    A_id INTEGER,
    A_name TEXT,

    PRIMARY KEY (A_id)
);


-- Table: Images
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


-- Table: Classes
CREATE TABLE IF NOT EXISTS Classes (
    C_id INTEGER,
    English_name TEXT,
    Chinese_name TEXT,

    PRIMARY KEY (C_id)
);


-- Table: Labels
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


-- View: Work, querying Annotators, Images, Labels
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


-- View: Work_count, querying Work and Annotators
CREATE OR REPLACE VIEW Work_count AS
WITH W AS (
    SELECT
        Work.A_id,
        CAST(COUNT(Work.I_file) AS INT) AS File_count,
        CAST(COUNT(*) AS INT) AS Label_count
    FROM Work
    GROUP BY Work.A_id
)

SELECT
    A.A_id,
    A.A_name,
    W.File_count,
    W.Label_count
FROM Annotators AS A INNER JOIN W ON A.A_id = W.A_id;


-- View: Instances, querying Classes and Labels
CREATE OR REPLACE VIEW Instances AS
SELECT
    C.C_id,
    C.English_name,
    C.Chinese_name,

    L.Image,
    L.Height,
    L.Width,
    L.Center_x,
    L.Center_y
FROM Labels AS L INNER JOIN Classes AS C ON L.L_class = C.C_id;


-- View: Instance_count, querying Instances and Classes
CREATE OR REPLACE VIEW Instance_count AS
WITH I AS (
    SELECT
        Instances.C_id,

        -- pg.PoolClient.query seems to consider bigint as string
        CAST(COUNT(*) AS INT) AS Instance_num,
        CAST(COUNT(Instances.Image) AS INT) AS Image_num
    FROM Instances
    GROUP BY Instances.C_id
)

SELECT
    C.C_id,
    C.English_name,
    C.Chinese_name,

    I.Image_num,
    I.Instance_num
FROM Classes AS C
INNER JOIN I ON C.C_id = I.C_id;


-- Function: clear split records
CREATE OR REPLACE FUNCTION clear_split() RETURNS SETOF IMAGES AS $$
WITH Results AS (
	UPDATE Images SET Split = '' 
    WHERE Split IN ('Train', 'Test')
    RETURNING *
)
SELECT * FROM Results ORDER BY I_file;
$$ LANGUAGE Sql;


-- Function: split images to Train or Test
CREATE OR REPLACE FUNCTION split_train_and_test(
    Test_size REAL
) RETURNS SETOF IMAGES AS $$
WITH Result AS (
    UPDATE Images SET Split = (
        CASE WHEN RANDOM()<Test_size THEN 'Test' ELSE 'Train' END
    )
    WHERE Split IS NULL
    RETURNING *
)
SELECT * FROM Result ORDER BY Split, I_file;
$$ LANGUAGE Sql;
