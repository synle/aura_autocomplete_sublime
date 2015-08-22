echo "pull latest submodule (Aura_Upstream)";
git submodule foreach git pull origin master;

echo "generate scripts";
npm run pkg;
