from fontTools.ttLib import TTFont
f = TTFont('./fonts/DuolingoFeatherBold_nocolor.ttf')
color_tables = ['COLR','CPAL','SBIX','CBDT','CBLC']
print('All tables:', list(f.keys()))
print('Color tables found:', [t for t in color_tables if t in f])
