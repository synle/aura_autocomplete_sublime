#!/bin/bash
if [ ! -d "~/Library/Application\ Support/Sublime\ Text\ 3/Packages/User" ]
then
	# #install on mac - sublime text 3
	echo "Directory Detected"
	echo "~/Library/Application\ Support/Sublime\ Text\ 3/Packages/User"

	echo "==="
	echo "Clean up previous installations of Aura"
	rm -f ~/Library/Application\ Support/Sublime\ Text\ 3/Packages/User/aura*.sublime-completions

	echo "==="
	echo "Copying aura snippets from bash"
	cp ./snippet/*.sublime-completions ~/Library/Application\ Support/Sublime\ Text\ 3/Packages/User/
else
	#!/bin/bash
	if [ ! -d "~/config/sublime-text-3/Packages/User" ]
	then
		# #install on mac - sublime text 3
		echo "Directory Detected"
		echo "~/config/sublime-text-3/Packages/User"
		
		echo "==="
		echo "Clean up previous installations of Aura"
		rm -f ~/config/sublime-text-3/Packages/User/aura*.sublime-completions

		echo "==="
		echo "Copying aura snippets from bash"
		cp ./snippet/*.sublime-completions ~/config/sublime-text-3/Packages/User
	else
		echo "Directory not found, please manually copy and paste the snippet to your Sublime Packages Folder."
	fi
fi