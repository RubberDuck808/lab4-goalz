from fontTools.ttLib import TTFont

f = TTFont('./fonts/DuolingoFeatherBold_nocolor.ttf')

# name table IDs: 4 = Full name, 6 = PostScript name
for record in f['name'].names:
    if record.nameID in (4, 6):
        old = record.toUnicode()
        new = old + ' NC'
        record.string = new.encode('utf-16-be')
        print(f'nameID {record.nameID}: "{old}" -> "{new}"')

f.save('./fonts/DuolingoFeatherBold_nocolor.ttf')
print('Done')
