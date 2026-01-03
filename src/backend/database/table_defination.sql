CREATE TABLE IF NOT EXISTS Annotators(
    ID INTEGER,
    Name TEXT,
    PRIMARY KEY(ID)
);

CREATE TABLE IF NOT EXISTS Classes (
	ID INTEGER,
	Chinese_Name TEXT,
	English_Name TEXT,
	PRIMARY KEY(ID)
);

CREATE TABLE IF NOT EXISTS Images (
	File TEXT,
	Split TEXT NOT NULL DEFAULT '' CHECK(Split IN ('Train', 'Test', 'Prediction', '')),
    
	Annotator INTEGER,
    Annotated_at DATE,

    Filmed_location TEXT,
    Filmed_at DATE,
    Source TEXT,
	PRIMARY KEY(File),
    FOREIGN KEY(Annotator) REFERENCES Annotators(ID) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Labels (
	Height REAL CHECK(Height BETWEEN 0.0 AND 1.0),
	Width REAL CHECK(Width BETWEEN 0.0 AND 1.0),
	Center_X REAL CHECK(Center_X BETWEEN 0.0 AND 1.0),
	Center_Y REAL CHECK(Center_Y BETWEEN 0.0 AND 1.0),
	Image TEXT NOT NULL,
	Class INTEGER NOT NULL,
	PRIMARY KEY(Height, Width, Center_X, Center_Y, Image, Class),
	FOREIGN KEY(Class) REFERENCES Classes(ID) ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY(Image) REFERENCES Images(File) ON UPDATE CASCADE ON DELETE CASCADE
);
