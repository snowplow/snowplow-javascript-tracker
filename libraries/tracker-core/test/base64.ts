/*
 * Copyright (c) 2022 Snowplow Analytics Ltd, 2010 Anthon Pang
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import test from 'ava';
import { base64urlencode, base64urldecode } from '../src/base64';

test('Base 64 encode a string', (t) => {
  t.is(base64urlencode('my_string'), 'bXlfc3RyaW5n');
});

test('Base 64 decode a string', (t) => {
  t.is(base64urldecode('bXlfc3RyaW5n'), 'my_string');
});

test('Base 64 encode a string containing special characters', (t) => {
  t.is(base64urlencode('™®字'), '4oSiwq7lrZc');
});

test('Base 64 decode a string containing special characters', (t) => {
  t.is(base64urldecode('4oSiwq7lrZc'), '™®字');
});

test('Base 64 encode json', (t) => {
  t.is(
    base64urlencode(
      JSON.stringify({
        string: 'this_is_json',
        number: 12,
        array: [1, 2, 3],
      })
    ),
    'eyJzdHJpbmciOiJ0aGlzX2lzX2pzb24iLCJudW1iZXIiOjEyLCJhcnJheSI6WzEsMiwzXX0'
  );
});

test('Base 64 decode json', (t) => {
  t.deepEqual(JSON.parse(base64urldecode('eyJzdHJpbmciOiJ0aGlzX2lzX2pzb24iLCJudW1iZXIiOjEyLCJhcnJheSI6WzEsMiwzXX0')), {
    string: 'this_is_json',
    number: 12,
    array: [1, 2, 3],
  });
});
