#install on mac - sublime text 3
echo "==="
echo "Installing Aura Complete for Sublime Text 3"
echo "Clean up previous installations of Aura"
rm -f ~/Library/Application\ Support/Sublime\ Text\ 3/Packages/User/aura*

echo "Copying aura snippets from bash"
cp ./snippet/aura.js.sublime-completions ~/Library/Application\ Support/Sublime\ Text\ 3/Packages/User/
cp ./snippet/aura.event.js.sublime-completions ~/Library/Application\ Support/Sublime\ Text\ 3/Packages/User/
cp ./snippet/aura.attributes.sublime-completions ~/Library/Application\ Support/Sublime\ Text\ 3/Packages/User/
cp ./snippet/aura.uitags.sublime-completions ~/Library/Application\ Support/Sublime\ Text\ 3/Packages/User/
