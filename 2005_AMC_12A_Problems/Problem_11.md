# 2005 AMC 12A Problem 11

## Problem
How many three-digit numbers satisfy the property that the middle digit is the average of the first and the last digits?


$$(\mathrm {A}) \ 41 \qquad (\mathrm {B}) \ 42 \qquad (\mathrm {C})\ 43 \qquad (\mathrm {D}) \ 44 \qquad (\mathrm {E})\ 45$$

## Solutions
### Solution 1
Let the digits be A, B, C so that B = $\frac$ {A + C}{2}. In order for this to be an integer, A and C have to have the same [parity](https://artofproblemsolving.com/wiki/index.php/parity). There are 9 possibilities for A, and 5 for C. B depends on the value of both A and C and is unique for each (A,C). Thus our answer is 9 $\cdot 5 \cdot 1 = 45 \implies E.$
### Solution 2
Thus, the three digits form an [arithmetic sequence](https://artofproblemsolving.com/wiki/index.php/arithmetic_sequence).

*If the numbers are all the same, then there are 9 possible three-digit numbers.
*If the numbers are different, then we count the number of strictly increasing arithmetic sequences between 0 and 10 and multiply by 2 for the decreasing ones:

{| class = "wikitable" border="1px solid"
|-
| Common difference || Sequences possible || Number of sequences
|-
$$| 1 || 012, \ldots, 789 || 8$$
|-
$$| 2 || 024, \ldots, 579 || 6$$
|-
$$| 3 || 036, \ldots, 369 || 4$$
|-
$$| 4 || 048, \ldots, 159 || 2$$
|}

This gives us $2(8+6+4+2) = 40$. However, the question asks for three-digit numbers, so we have to ignore the four sequences starting with 0. Thus our answer is $40 + 9 - 4 = 45\Longrightarrow \mathrm{(E)}.$
