# 2022 AMC 12B Problem 17

## Problem
How many 4 $\times 4$ arrays whose entries are $0s$ and $1s$ are there such that the row sums (the sum of the entries in each row) are 1, 2, 3, and 4, in some order, and the column sums (the sum of the entries in each column) are also 1, 2, 3, and 4, in some order? For example, the array

$$
\left[ \begin{array}{cccc} 1 & 1 & 1 & 0 \\ 0 & 1 & 1 & 0 \\ 1 & 1 & 1 & 1 \\ 0 & 1 & 0 & 0 \\ \end{array} \right]
$$

satisfies the condition.

$\textbf{(A) }144 \qquad \textbf{(B) }240 \qquad \textbf{(C) }336 \qquad \textbf{(D) }576 \qquad \textbf{(E) }624$
## Solution 1 (One-to-One Correspondence)
Note that the arrays and the sum configurations have one-to-one correspondence. Furthermore, the row sum configuration and the column sum configuration are independent of each other. Therefore, the answer is (4!$)^2=\boxed{\textbf{(D) }576}.$

**Remark**

For any given sum configuration, we can uniquely reconstruct the array it represents. Conversely, for any array, it is clear that we can determine the unique sum configuration associated with it. Therefore, this establishes a one-to-one correspondence between the arrays and the sum configurations.

*~bad_at_mathcounts ~MRENTHUSIASM ~tsun26*
## Solution 2 (Linear Transformation and Permutation)
In this problem, we call a matrix that satisfies all constraints given in the problem a feasible matrix.

First, we observe that if a matrix is feasible, and we swap two rows or two columns to get a new matrix, then this new matrix is still feasible.

Therefore, any feasible matrix can be obtained through a sequence of such swapping operations from a feasible matrix where for all i $\in \left\{ 1, 2, 3 ,4 \right\}$, the sum of entries in row i is i and the sum of entries in column i is i, hereafter called as a benchmark matrix.

Second, we observe that there is a unique benchmark matrix, as shown below:

$$
\left[ \begin{array}{cccc} 0 & 0 & 0 & 1 \\ 0 & 0 & 1 & 1 \\ 0 & 1 & 1 & 1 \\ 1 & 1 & 1 & 1 \\ \end{array} \right]
$$

With above observations, we now count the number of feasible matrixes.
We construct a feasible matrix in the following steps.

Step 1: We make a permutation of rows of the benchmark matrix.

The number of ways is 4!.

Step 2: We make a permutation of columns of the matrix obtained after Step 1.

The number of ways is 4!.

Following from the rule of product, the total number of feasible matrixes is 4! $\cdot $4! = $\boxed{\textbf{(D) }576}.$

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## Solution 3 (Multiplication Principle)
Of the sixteen entries in one such array, there are six $0s$ and ten $1s$. The rows and the columns each have zero, one, two, and three $0s$, in some order. Once we decide the positions of the $0s$, we form one such array.

We perform the following steps:

 1.   There are $\binom41=4$ ways to choose the row with three 0 s. After that, there are $\binom43=4$ ways to choose the positions of the three 0 s.

2.   There are $\binom31=3$ ways to choose the column with three 0 s. After that, there are $\binom32=3$ ways to choose the positions of the two additional 0 s.

3.   There are $\binom41=4$ ways to choose the position of the last 0: It is the intersection of the column of one 0 in Step 1 and the row of one 0 in Step 2.

Together, the answer is $4\cdot4\cdot3\cdot3\cdot4=\boxed{\textbf{(D) }576}.$

*~MRENTHUSIASM*
## Solution 4 (Multiplication Principle)
Since exactly 1 row sum is 4 and exactly 1 column sum is 4, there is a unique entry in the array such that it, and every other entry in the same row or column, is a 1. Since there are 16 total entries in the array, there are 16 ways to choose the entry with only $1s$ in its row and column.

Without loss of generality, let that entry be in the top-left corner of the square. Note that there is already 1 entry numbered 1 in each unfilled row, and 1 entry numbered 1 in each unfilled column. Since exactly 1 row sum is 1 and exactly 1 column sum is 1, there is a unique entry in the $3\times3$ array of the empty squares such that it, and every other entry in the same row or column in the $3\times3$ array is a 0. Using a process similar to what we used in the first paragraph, we can see that there are 9 ways to choose the entry with only 0 in its row and column (in the $3\times3$ array).

Without loss of generality, let that entry be in the bottom-right corner of the square. Then, the remaining empty squares are the 4 center squares. Of these, one of the columns of the empty $2\times2$ array will have two $1s$ and the other column will have one 1. That happens if and only if exactly 1 of the remaining squares is filled with a 0, and there are 4 ways to choose that square. Filling that square with a 0 and the other 3 squares with $1s$ completes the grid.

All in all, there are $4\cdot9\cdot16=\boxed{\textbf{(D) }576}$ ways to complete the grid.

*~pianoboy*

*~mathboy100 (minor $\LaTeX$ fix)*
## Solution 5 (Meta Solving / Conjectures)
Note that swapping any two rows or any two columns or both from the given example array, leads to a new array that satisfies the condition. There are 4 rows, and you choose 2 to swap, so $\frac{4!}{2!2!} = 6$; likewise for columns. Therefore, $6\cdot6 = 36.$ Clearly, the final answer must be divisible by 36, so we can eliminate $\textbf{(B)}, \textbf{(C)}$ and $\textbf{(E)}.$

Now, you are in exam mode with not much time left. You see that 144 = $4\cdot36$ while 576 = $16\cdot36.$ There are 16 elements in the array (4 rows and 4 columns), so you go with $\boxed{\textbf{(D) }576},$ and this is indeed the correct answer!

*~alphamugamma*
## Solution 6 (Clever)
One of the elements in the array has the property that the row and column it is in are full of ones (like solution 4). There are 16 spots to place this element. Remove these rows and columns from the array, then we have a $3\times3$ array. Notice that this array has to have a row and column of zeros. (This is because in the original $4\times4$ array, the row of ones will already satisfy one column; the one that needs one 1. The rest of that column are zeros, and vice versa for the row. There are 9 points to place the intersection of these rows in the $3\times3$ array. Continue like this for the $2\times2$ array, where there will be 4 points to place the intersection of the rows only containing ones. Finally, the last $1\times1$ array must contain a zero. The answer is $16\cdot 9\cdot 4=\boxed{\textbf{(D) }576}$

*~Moonwatcher22*
## Video Solution (Quick)
https://youtu.be/NIuo5i3nFzo

_~Education, the Study of Everything_
## Video Solution
https://youtu.be/_dN_ZHiaiko

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## Video Solution
https://youtu.be/JVDlHCSPF6k
## See Also
