cd "/Users/fabrizioguccione/Desktop/IMS/p5mirror-Fabri/downloads/../p5projects"
#
echo unzip 1 "Jumpy air-V8CLWhatq"
rm -rf "./Jumpy air-V8CLWhatq"
mkdir "./Jumpy air-V8CLWhatq"
pushd "./Jumpy air-V8CLWhatq" > /dev/null
unzip -q "../../downloads/zips/Jumpy air-V8CLWhatq"
popd > /dev/null
#
echo unzip 2 "procedural circuit diagram V1-KChUe9Y_d"
rm -rf "./procedural circuit diagram V1-KChUe9Y_d"
mkdir "./procedural circuit diagram V1-KChUe9Y_d"
pushd "./procedural circuit diagram V1-KChUe9Y_d" > /dev/null
unzip -q "../../downloads/zips/procedural circuit diagram V1-KChUe9Y_d"
popd > /dev/null
#
echo unzip 3 "procedural circuit diagram V0-i60-W2eZN"
rm -rf "./procedural circuit diagram V0-i60-W2eZN"
mkdir "./procedural circuit diagram V0-i60-W2eZN"
pushd "./procedural circuit diagram V0-i60-W2eZN" > /dev/null
unzip -q "../../downloads/zips/procedural circuit diagram V0-i60-W2eZN"
popd > /dev/null
#
echo unzip 4 "ims03-fabri-5y2x84BeB"
rm -rf "./ims03-fabri-5y2x84BeB"
mkdir "./ims03-fabri-5y2x84BeB"
pushd "./ims03-fabri-5y2x84BeB" > /dev/null
unzip -q "../../downloads/zips/ims03-fabri-5y2x84BeB"
popd > /dev/null
#
echo unzip 5 "Semantic Search - Guccione.com Text Search V1-XDgg7hVTf"
rm -rf "./Semantic Search - Guccione.com Text Search V1-XDgg7hVTf"
mkdir "./Semantic Search - Guccione.com Text Search V1-XDgg7hVTf"
pushd "./Semantic Search - Guccione.com Text Search V1-XDgg7hVTf" > /dev/null
unzip -q "../../downloads/zips/Semantic Search - Guccione.com Text Search V1-XDgg7hVTf"
popd > /dev/null
#
echo unzip 6 "W8 createCapture() + Pixelation-2fBEx7UBz"
rm -rf "./W8 createCapture() + Pixelation-2fBEx7UBz"
mkdir "./W8 createCapture() + Pixelation-2fBEx7UBz"
pushd "./W8 createCapture() + Pixelation-2fBEx7UBz" > /dev/null
unzip -q "../../downloads/zips/W8 createCapture() + Pixelation-2fBEx7UBz"
popd > /dev/null
#
echo unzip 7 "Simple Image Semantic Search - Guccione.com Image Search V1-1XYsbrfer"
rm -rf "./Simple Image Semantic Search - Guccione.com Image Search V1-1XYsbrfer"
mkdir "./Simple Image Semantic Search - Guccione.com Image Search V1-1XYsbrfer"
pushd "./Simple Image Semantic Search - Guccione.com Image Search V1-1XYsbrfer" > /dev/null
unzip -q "../../downloads/zips/Simple Image Semantic Search - Guccione.com Image Search V1-1XYsbrfer"
popd > /dev/null
#
echo unzip 8 "Simple Image Semantic Search - Guccione.com Image Search V0-aDC4s6UBQ"
rm -rf "./Simple Image Semantic Search - Guccione.com Image Search V0-aDC4s6UBQ"
mkdir "./Simple Image Semantic Search - Guccione.com Image Search V0-aDC4s6UBQ"
pushd "./Simple Image Semantic Search - Guccione.com Image Search V0-aDC4s6UBQ" > /dev/null
unzip -q "../../downloads/zips/Simple Image Semantic Search - Guccione.com Image Search V0-aDC4s6UBQ"
popd > /dev/null
#
echo unzip 9 "Semantic Search - Guccione.com Text Search V0-jmX_VCR_v"
rm -rf "./Semantic Search - Guccione.com Text Search V0-jmX_VCR_v"
mkdir "./Semantic Search - Guccione.com Text Search V0-jmX_VCR_v"
pushd "./Semantic Search - Guccione.com Text Search V0-jmX_VCR_v" > /dev/null
unzip -q "../../downloads/zips/Semantic Search - Guccione.com Text Search V0-jmX_VCR_v"
popd > /dev/null
#
echo unzip 10 "ChatBot Conversation With Hisotry-3j7OJn3nx"
rm -rf "./ChatBot Conversation With Hisotry-3j7OJn3nx"
mkdir "./ChatBot Conversation With Hisotry-3j7OJn3nx"
pushd "./ChatBot Conversation With Hisotry-3j7OJn3nx" > /dev/null
unzip -q "../../downloads/zips/ChatBot Conversation With Hisotry-3j7OJn3nx"
popd > /dev/null

cd ..
# remove redundant p5.js p5.sound.min.js
rm -f p5projects/*/p5.*
# sync last_updatedAt.txt
cd downloads/json
if [ -e pending_updatedAt.txt ]; then
  rm -f last_updatedAt.txt
  mv pending_updatedAt.txt last_updatedAt.txt
fi