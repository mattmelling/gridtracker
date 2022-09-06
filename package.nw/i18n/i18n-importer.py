#!/usr/bin/python3

def readDiff():
    with open('patch.diff', encoding='utf-8', errors="ignore") as diff_file:
        lines = diff_file.readlines()
        # sample lines
        # -      <div id="startupStatusDiv" data-i18n="startupStatusDiv">Initial Startup</div>
        # +      <div id="startupStatusDiv">初始化启动</div>
        json_output = open("cn.json", "a")
        for index, line in enumerate(lines):
            if line.startswith("-") and lines[index + 1].startswith("+") and 'data-i18n' in line:
                # remove prefix '-'
                sanitized_line = line[1:]
                print(f"sanitized_line: {sanitized_line}")
                # remove prefix '+'
                sanitized_next_line = lines[index + 1][1:]
                print(f"sanitized_next_line: {sanitized_next_line}")
                key_start = sanitized_line.index('data-i18n') + 11
                key_to_end = sanitized_line[key_start:]
                key_end = key_to_end.index('"')
                i18n_key = sanitized_line[key_start: key_start + key_end]
                print(f"i18n_key: {i18n_key}")

                # remove data-i18n-tag
                i18n_removed_line = f"{sanitized_line[0: sanitized_line.index('data-i18n') -1]}{sanitized_line[key_start + key_end + 1:]}"
                print(i18n_removed_line)

                translated_phrase = ''
                # this will output string with ending tag like this: 初始化启动</div>
                for line_index, char in enumerate(sanitized_next_line):
                    if len(i18n_removed_line) > line_index and char == i18n_removed_line[line_index]:
                        continue
                    else:
                        translated_phrase = f"{translated_phrase}{char}"
                print(f"translated_phrase: {translated_phrase}")
                # now remove closing tag
                if translated_phrase:
                    for line_index, char in enumerate(i18n_removed_line[::-1]):
                        if len(sanitized_next_line) > line_index and char == sanitized_next_line[::-1][line_index]:
                            translated_phrase = translated_phrase[:-1]
                        else:
                            break

                print(f"translated_phrase: {translated_phrase}")
                # partial json: "legend.title": "Legend",
                json_output.write(f'"{i18n_key}": "{translated_phrase}",\n')


def main():
    readDiff()


if __name__ == "__main__":
    main()
