Wadbook - ગામ અને પેટા જાતિ (શાખ) સર્ચ ડિરેક્ટરી ઇન્સ્ટોલેશન ગાઇડ
=================================================================

આ ZIP ફાઇલમાં ૩ ફાઇલો છે:
1. samaj-data.js          -> ૨૭ શાખ + ૪૮ ગામો/શહેરો + ડાયનેમિક લિસ્ટ એન્જિન
2. directory.html         -> ગામ અને શાખ સર્ચ ડિરેક્ટરી પેજ
3. search-integration.js  -> index.html ના મુખ્ય સર્ચ બારમાં ઓટો-સજેશન

GitHub પર અપલોડ કરવાની રીત:
1. આ ZIP ફાઇલને Extract (અનઝિપ) કરો.
2. ત્રણેય ફાઇલો (samaj-data.js, directory.html, search-integration.js) તમારા GitHub રિપોઝિટરીમાં જ્યાં index.html છે ત્યાં અપલોડ કરો.
3. તમારા index.html માં </body> ટેગની બરાબર ઉપર આ બે લાઇન ઉમેરી દો:
   <script src="samaj-data.js"></script>
   <script src="search-integration.js"></script>
4. ભવિષ્યમાં નવા ગામ કે શાખ ઉમેરવા હોય તો ફક્ત samaj-data.js ખોલીને યાદીમાં નામ ઉમેરી દેજો.
