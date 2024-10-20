# FYP_Application
A generative ai mobile application that would serve as a companion for mute individuals to assist them in their conversations with a normal speaker. The application improves the convenience of mute users by generating personalized responses at real time for them to pick to reply to a normal speaker. Overtime, the app grows with the users by learning their habits and past experiences therefore improving the quality of generated responses to become more personal. Lastly, to enhance greater flexibility for the mute user, they are also able to edit the generated responses directly and provide feedback to the ai model through liking or disliking certain responses.

Email: roydonauyrfyp1

To create the app:

**Frontend**
1. Run npx create-expo-app MuteApp --template blank
2. Run npm install for dependencies


**Backend**
1. To create new python venv: python -m venv venv
2. To activate venv: .\venv\Scripts\activate.ps1

**To run:**
**Note: For apis to work, the ip address in the config file under components must be changed**.

**Frontend**
1. npm run start

**Backend commands**
***Running on localhost: 8000***
1. To reload backend: uvicorn main:app --reload (Remove reload once in production)

