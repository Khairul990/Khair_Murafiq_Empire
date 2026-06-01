# Firestore Rules Manual Deployment Guide

**CRITICAL**: Do NOT attempt to migrate your live dashboard data to Firestore until these security rules are successfully published. Without these rules, your Control Room database is dangerously exposed to the public internet.

Follow these simple manual steps to secure your database:

## Step 1: Open Firebase Console
1. Go to your [Firebase Console](https://console.firebase.google.com/).
2. Select the `Khair Murafiq Empire OS` project.

## Step 2: Navigate to Firestore
1. On the left-hand menu, expand the **Build** section.
2. Click on **Firestore Database**.

## Step 3: Access the Rules Editor
1. At the top of the Firestore Database page, click the **Rules** tab.
2. You will see an editor box containing the current (likely insecure or default) rules.

## Step 4: Paste and Publish
1. Open the `firestore.rules.example` file located in the root of your project folder.
2. Select ALL text in that file and **Copy** it.
3. Return to the Firebase Console. Select ALL text in the Rules editor box and **Delete** it.
4. **Paste** your copied rules into the editor box.
5. Review the code to ensure `khairul2052007@gmail.com` is present in the `isOwner()` function.
6. Click the blue **Publish** button at the top of the editor.

## Step 5: Verify and Test
1. Wait for the "Rules published successfully" toast notification in the Firebase Console.
2. Return to your live Control Room website.
3. Go to the **Settings** page.
4. Click the **Test Firebase Connection** button.
5. If the test returns **Connected**, your rules are active and your database is 100% secure!

Once you have completed this guide and tested the connection successfully, you are officially ready for Data Migration.
