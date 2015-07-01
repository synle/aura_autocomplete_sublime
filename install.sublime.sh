#install on mac - sublime text 3
echo "==="
echo "Installing Aura Complete for Sublime Text 3"
echo "Clean up previous installations of Aura"
rm -f ~/Library/Application\ Support/Sublime\ Text\ 3/Packages/User/aura*.sublime-completions

echo "Copying aura snippets from bash"
cp ./snippet/*.sublime-completions ~/Library/Application\ Support/Sublime\ Text\ 3/Packages/User/
