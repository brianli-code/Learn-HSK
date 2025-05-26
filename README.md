# Learn HSK

This is a flashcard and quiz application designed to help users learn vocabulary for the HSK (Chinese Proficiency Test) levels 3 and 4. This app includes audio playback to each vocabulary word or phrase.

## Instructions to Run the App

1. **Clone the Repository**: 
    ```bash
    git clone https://github.com/brianli-code/Learn-HSK.git
    cd Learn-HSK
    ```

2. **Install Dependencies**: 
    Make sure you have [Node.js](https://nodejs.org/en) installed. Then run:
    ```bash
    npm install
    ```

3. **Start the Application**: 
    Run the following command to start the app:
    ```bash
        npm run start
   ```

4. **If you want to build the application**:
   - MacOS:
        1. Open in Xcode
        2. Click build

   - Windows or Linux:
       ```bash
       npm run dist
       cd dist/win-unpacked
       ./Learn-HSK.exe
       ```

## Functionality To Add
- [x] audio playback for both modes
- [x] expand vocab to HSK 4
- [x] dark mode
- [x] add keyboard controls to quiz mode (1 to 4)
- [x] stopwatch in quiz mode
- [x] add tailwind
- [x] typescript refactor
- [] shadcn, react, next.js refactor
- [ ] search bar for flashcards
- [ ] add AI integration to flashcards and quizzes
- [ ] media integration to express interest in specific topics
    - music
    - tv shows
    - etc.
