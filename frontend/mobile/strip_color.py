from fontTools.ttLib import TTFont
f = TTFont('./fonts/DuolingoFeatherBold.ttf')
for table in ['COLR','CPAL','SBIX','CBDT','CBLC']:
    if table in f:
        del f[table]
f.save('./fonts/DuolingoFeatherBold_nocolor.ttf')
print('Done')
