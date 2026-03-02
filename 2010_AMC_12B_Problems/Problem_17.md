# 2010 AMC 12B Problem 17

> This problem is the same as [2010 AMC 12B #17](https://artofproblemsolving.com/wiki/index.php/2010_AMC_12B_Problems) and [2010 AMC 10B #23](https://artofproblemsolving.com/wiki/index.php/2010_AMC_10B_Problems).
## Problem
The entries in a 3 $\times 3$ array include all the digits from 1 through 9, arranged so that the entries in every row and column are in increasing order. How many such arrays are there?

$\textbf{(A)}\ 18 \qquad \textbf{(B)}\ 24 \qquad \textbf{(C)}\ 36 \qquad \textbf{(D)}\ 42 \qquad \textbf{(E)}\ 60$
## Solution 1
Observe that all tables must have $1s$ and $9s$ in the corners, $8s$ and $2s$ next to those corner squares, and 4-6 in the middle square. Also note that for each table, there exists a valid table diagonally symmetrical across the diagonal extending from the top left to the bottom right.

***Case 1: Center 4**

$$
\begin{tabular}{|c|c|c|} \hline 1&2&\\ \hline 3&4&8\\ \hline &&9\\ \hline \end{tabular} \;\;\; \begin{tabular}{|c|c|c|} \hline 1&2&\\ \hline 3&4&\\ \hline &8&9\\ \hline \end{tabular}
$$


3 necessarily must be placed as above. Any number could fill the isolated square, but the other 2 are then invariant. So, there are 3 cases each and 6 overall cases. Given diagonal symmetry, alternate 2 and 8 placements yield symmetrical cases. 2*6=12

***Case 2: Center 5**

$$
\begin{tabular}{|c|c|c|} \hline 1&2&3\\ \hline 4&5&\\ \hline &8&9\\ \hline \end{tabular} \;\;\; \begin{tabular}{|c|c|c|} \hline 1&2&\\ \hline 3&5&\\ \hline &8&9\\ \hline \end{tabular} \;\;\; \begin{tabular}{|c|c|c|} \hline 1&2&\\ \hline 3&5&8\\ \hline &&9\\ \hline \end{tabular} \;\;\; \begin{tabular}{|c|c|c|} \hline 1&2&3\\ \hline 4&5&8\\ \hline &&9\\ \hline \end{tabular}
$$


Here, no $3s$ or $7s$ are assured, but this is only a teensy bit trickier and messier. WLOG, casework with 3 instead of 7 as above. Remembering that $4<5$, logically see that the numbers of cases are then 2,3,3,1 respectively. By symmetry, 2*9=18

***Case 3: Center 6**
By inspection, realize that this is symmetrical to case 1 except that the $7s$ instead of the $3s$ are assured.
$$2*6=12$$

$$12+18+12=\boxed{\textbf{(D) }42}$$

*~BJHHar*
## Solution 2
This solution is trivial by the hook length theorem. The hooks look like this:


$$
\begin{tabular}{|c|c|c|} \hline 5 & 4 & 3 \\ \hline 4 & 3 & 2\\ \hline 3 & 2 & 1\\ \hline \end{tabular}
$$


So, the answer is $\frac{9!}{5 \cdot 4 \cdot 3 \cdot 4 \cdot 3 \cdot 2 \cdot 3 \cdot 2 \cdot 1} = \boxed{\text{(D) }42}$

P.S. The hook length formula is a formula to calculate the number of standard Young tableaux of a Young diagram. Numberphile has an easy-to-understand video about it here: https://www.youtube.com/watch?v=vgZhrEs4tuk The full proof is quite complicated and is not given in the video, although the video hints at possible proofs.

Hook length theorem: take any shape made out of congruent squares and say the rules are just like the problem described. Each cell/square in what the shape that you have has what is called a " Hook Number ". To find this hook number, you count the number of cells/squares that are directly below the cell, and the ones that are to the right of the cell, including the cell itself(THIS ASSUMES THAT THE SHAPE IS "LEFT-JUSTIFIED", which means all the rows and columns are aligned to the left). Now, the total number of arrangements that satisfy our conditions of being increasing in rows and columns (in the literature these are called "Standard Young Tableaux ") is the number of cells/squares factorial, divided by the product of the hook numbers of all the cells. Ex:


$$
\begin{tabular}{|c|c|c|} \hline 4 & 3 & 2\\ \hline 3 & 2 & 1\\ \hline \end{tabular}
$$


Here, the top left cell has 1 square below it, 2 to it's right, and counting itself, that gives it a hook number of 4. Therefore the answer will be $\frac{6!}{4\cdot 3 \cdot 2 \cdot 3 \cdot 3 \cdot 2 \cdot 1}$

*~edits by glowworm*
## Solution 3 (Doesn't require the hook length formula, copied from Solution 1 and the Beauty of Math video)
As Solution number one and the videos said 1 and 9 must go on the top left and top right.
The middle must be 4, 5, or 6 because there must be two numbers less than it to fill the top middle and left middle squares (so 2 and 3 can't be in the middle) and two numbers more than it to fil the right middle and bottom middle squares (7 and 8 don’t work).

So, first casework with the middle being 4. 2 and 3 must go in the middle top and the middle left boxes because they are the only numbers smaller than 4. There are 2 ways to arrange the 2 and 3 because they can flip their places in the middle top and middle left boxes.

$$
\begin{tabular}{|c|c|c|} \hline 1&2&\\ \hline 3&4&\\ \hline &&9\\ \hline \end{tabular} \;\;\; \begin{tabular}{|c|c|c|} \hline 1&3&\\ \hline 2&4&\\ \hline &&9\\ \hline \end{tabular}
$$

Now, for the rightmost column, choose 2 numbers from the 4 remaining numbers (5, 6, 7, and 8) to fill in that column. Since those two numbers have to increase going downwards, there is only one way to arrange those 2 numbers. The two remaining numbers must automatically go to the two spots remaining on the bottom row, and likewise there is only one way to arrange them. For example, if I picked 5 and 8 to go in the 2 spots in the rightmost square, I would have one of these two charts (there were two ways to arrange the 2 and 3 in the chart):

$$
\begin{tabular}{|c|c|c|} \hline 1&2&5\\ \hline 3&4&8\\ \hline 6&7&9\\ \hline \end{tabular} \;\;\; \begin{tabular}{|c|c|c|} \hline 1&3&5\\ \hline 2&4&8\\ \hline 6&7&9\\ \hline \end{tabular}
$$

So, the number of ways to make a chart where the middle number is 4 is 2 $\cdot \binom{4}{2} = 2\cdot6 = 12$ ways.

For the case when the middle is 6, it is exactly symmetric to the middle being 4 but on the opposite side. 7 and 8 must be in the bottom middle and right middle squares because if you tried to put any other number in those two squares that number would have to be bigger than 7 and 8 but smaller than 9. So there are 2 ways to arrange 7 and 8 (because they can flip themselves) and 4 choose 2 ways to choose two numbers (out of 2, 3, 4, and 5) to go in the two spaces available on the leftmost column. Again, the remaining two numbers will be forced to go in only one way on the two spaces available on the top row, meaning there are also 12 ways to make a chart with the middle number being 6. Example- 7 and 8 are in the bottom middle and right middle squares respectively and I chose 2 and 3 to be the numbers on the two spots on the leftmost column:

$$
\begin{tabular}{|c|c|c|} \hline 1&4&5\\ \hline 2&6&8\\ \hline 3&7&9\\ \hline \end{tabular}
$$


The case when the middle is 5 is the hardest case.
The numbers 2, 3, and 4 will fill in spaces from the top left until the diagonal with 5, and either the top right or bottom left square will be left blank (no blanks before that because the box must increase). So there are 2 choices which one to leave blank:

$$
\begin{tabular}{|c|c|c|} \hline 1&&\\ \hline &5&\\ \hline x&&9\\ \hline \end{tabular} \;\;\; \begin{tabular}{|c|c|c|} \hline 1&&x\\ \hline &5&\\ \hline &&9\\ \hline \end{tabular}
$$

There are 3 choices for the box (either 2, 3, or 4) immediately next to the blank box between 1 and the blank box and the other 2 numbers (from 2, 3, or 4) will sort themselves. For example, if I chose the blank box to be the bottom left box and I chose the number immediately next to the blank box to be 2, the grid would look like this:

$$
\begin{tabular}{|c|c|c|} \hline 1&3&4\\ \hline 2&5&\\ \hline &&9\\ \hline \end{tabular}
$$

Now there are 2 empty spaces in either the rightmost or the bottommost row (the row with the square you chose to be blank and 9)  and 1 empty space in the middle of the other row with 9 and a value of 2, 3, or 4. Example- the two empty spaces are marked with an p and the one empty space in the other row is marked with a q:

$$
\begin{tabular}{|c|c|c|} \hline 1&3&4\\ \hline 2&5&q\\ \hline p&p&9\\ \hline \end{tabular}
$$

Finally, pick either 6, 7, or 8 to fill the box marked q (the one empty space between a value of 2, 3, or 4) and the remaining two numbers from 6, 7 or 8 will sort itself in the two boxes marked with a p. This is 3 choose 1 = 3 ways. Thus, there are 2 ways to choose the blank box, 3 ways to choose the number (2, 3, or 4) between the blank box and 1, and 3 ways to choose the box on the opposite side of the number between the blank box and 1, and all the other numbers are forced to arrange themselves in 1 way. This means there are $2\cdot3\cdot3=18$ ways to make a chart with 5 in the middle.

The answer to the problem is 12+12+18 = $\boxed{\text{(D) }42}$ ways to make a chart in total.

*~unhappyfarmer*
## Video Solution by Pi Academy (Fast and Easy)
https://youtu.be/3gwxQ1fjxQM?si=oL0HxnoYSgyl1Rh6

*~Pi Academy*
## Video Solution 2: TheBeautyOfMath
https://www.youtube.com/watch?v=ZfnxbpdFKjU&t=422s

*~TheBeautyOfMath*
## See also
