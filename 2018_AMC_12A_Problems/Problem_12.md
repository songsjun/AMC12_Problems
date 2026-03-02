# 2018 AMC 12A Problem 12

> This problem is the same as [2018 AMC 10A #17](https://artofproblemsolving.com/wiki/index.php/2018_AMC_10A_Problems/Problem_17) and [2018 AMC 12A #12](https://artofproblemsolving.com/wiki/index.php/2018_AMC_12A_Problems/Problem_12).
## Problem
Let $S$ be a set of $6$ integers taken from $\{1,2,\dots,12\}$ with the property that if $a$ and $b$ are elements of $S$ with $a<b$, then $b$ is not a multiple of $a$. What is the least possible value of an element in $S$?

$\textbf{(A)}\ 2\qquad\textbf{(B)}\ 3\qquad\textbf{(C)}\ 4\qquad\textbf{(D)}\ 5\qquad\textbf{(E)}\ 7$
## Solution 1
We start with $2$ because $1$ is not an answer choice. We would have to include every odd number except $1$ to fill out the set, but then $3$ and $9$ would violate the rule, so that won't work.

Experimentation with $3$ shows it's likewise impossible. You can include $7,11,$ and either $5$ or $10$ (which are always safe). But after adding either $4$ or $8$ we have no more valid numbers.

Finally, starting with $4,$ we find that the sequence $4,5,6,7,9,11$ works, giving us $\boxed{\textbf{(C)}\ 4}.$
## Solution 2
We know that all odd numbers except $1,$ namely $3, 5, 7, 9, 11,$ can be used.

Now we have $7$ possibilities to choose from for the last number (out of $1, 2, 4, 6, 8, 10, 12$). We can eliminate $1, 2, 10,$ and $12,$ and we have $4, 6, 8$ to choose from. However, $9$ is a multiple of $3.$ Now we have to take out either $3$ or $9$ from the list. If we take out $9,$ none of the numbers would work, but if we take out $3,$ we get

$$4, 5, 6, 7, 9, 11.$$


The least number is $4,$ so the answer is $\boxed{\textbf{(C)}\ 4}.$
## Solution 3
We can get the multiples for the numbers in the original set with multiples in the same original set


$$\begin{align*}
1&: \ $\text{all elements of }$$\{1,2,\dots,12\}$ \\
2&: \ 4,6,8,10,12 \\
3&: \ 6,9,12 \\
4&: \ 8,12 \\
5&: \ 10 \\
6&: \ 12
$\end{align*}$$$


It will be safe to start with $5$ or $6$ since they have the smallest number of multiples as listed above, but since the question asks for the least, it will be better to try others.

Trying $4,$ we can get $4,5,6,7,9,11.$ So $4$ works.
Trying $3,$ it won't work, so the least is $4.$ This means the answer is $\boxed{\textbf{(C)}\ 4}.$
## Solution 4
We partition $\{1,2,\ldots,12\}$ into six nonempty subsets such that for every subset, each element is a multiple of all elements less than or equal to itself:

$$\{1,2,4,8\}, \ \{3,6,12\}, \ \{5,10\}, \ \{7\}, \ \{9\}, \ \{11\}.$$


Clearly, $S$ must contain exactly one element from each subset:

- For $\{5,10\},$ we can select either $5$ or $10.$

- For $\{3,6,12\},$ we can select either $6$ or $12.$ Recall that since $\in S,$ we cannot select $3.$

- For $\{1,2,4,8\},$ we can select either $4$ (provided that $\not\in S$) or $8.$ Recall that since either $\in S$ or $\in S,$ we can select neither $1$ nor $2.$

If $\in S,$ then the possibilities of $S$ are $\{4,5,6,7,9,11\}$ or $\{4,6,7,9,10,11\}.$ So, the least possible value of an element in $S$ is $\boxed{\textbf{(C)}\ 4}.$

<u><b>Remark</b></u>

There exist multiple such partitions of $\{1,2,\ldots,12\}$ into six nonempty subsets, one of which is

$$\{1,2,6,12\}, \ \{3,9\}, \ \{4,8\}, \ \{5,10\}, \ \{7\}, \ \{11\}.$$


Regardless of which partition we use, we will conclude that to minimize the least element of $S,$ the only possibilities for $S$ are $\{4,5,6,7,9,11\}$ or $\{4,6,7,9,10,11\}.$

*~MRENTHUSIASM*
## Solution 5
We start with 2 as 1 is not an answer option. Our set would be $\{2,3,5,7,11\}$. We realize we cannot add 12 to the set because 12 is a multiple of 3. Our set only has 5 elements, so starting with 2 won't work.

We try 3 next. Our set becomes $\{3,4,5,7,11\}$. We run into the same issue as before so starting with 3 won't work.

We then try 4. Our set becomes $\{4,5,6,7,9,11\}$. We see we have 6 elements with none being multiples of each other. Therefore our answer is $\boxed{\textbf{(C)}\ 4}.$

~[https://artofproblemsolving.com/wiki/index.php/User:South South]
## Video Solution
https://youtu.be/M22S82Am2zM

*~IceMatrix*
## Video Solution
https://youtu.be/QtqBEZAgXpk

*~savannahsolver*
## See Also
