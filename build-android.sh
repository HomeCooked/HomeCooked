#!/bin/sh
ionic prepare android
cordova build --release android
echo "Copying to build/"
rm build/android-release-unsigned.apk
cp platforms/android/build/outputs/apk/android-release-unsigned.apk build/
cd build/
echo "Signing apk"
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore -storepass h0mec00ked -keypass Nirdlav0 android-release-unsigned.apk alias_name
FINAL_APK="HomeCooked-$1.apk"
rm $FINAL_APK
~/Library/Android/sdk/build-tools/22.0.1/zipalign -v 4 android-release-unsigned.apk $FINAL_APK
echo "Deleting temp files"
rm android-release-unsigned.apk
cd ..
echo "Done!"
