# 2020 AMC 12B Problem 15

> This problem is the same as [2020 AMC 10B #17](https://artofproblemsolving.com/wiki/index.php/2020_AMC_10B_Problems) and [2020 AMC 12B #15](https://artofproblemsolving.com/wiki/index.php/2020_AMC_12B_Problems).
## Problem
There are $10$ people standing equally spaced around a circle. Each person knows exactly $3$ of the other $9$ people: the $2$ people standing next to her or him, as well as the person directly across the circle. How many ways are there for the $10$ people to split up into $5$ pairs so that the members of each pair know each other?

$\textbf{(A)}\ 11 \qquad\textbf{(B)}\ 12 \qquad\textbf{(C)}\  13 \qquad\textbf{(D)}\ 14 \qquad\textbf{(E)}\ 15$
## Solution
Consider the $10$ people to be standing in a circle, where two people opposite of each other form a diameter of the circle.

Let us use casework on the number of pairs that form a diameter of the circle.

Case 1: $0$ diameters

There are $2$ ways: either $1$ pairs with $2$, $3$ pairs with $4$, and so on or $10$ pairs with $1$, $2$ pairs with $3$, etc. So $\boxed{\textbf{2}}$ cases.

Case 2: $1$ diameter


> [Asymptote diagram - not rendered in Markdown]

```asy
There are $5$ possible diameters to draw (everyone else pairs with the person next to them). So $\boxed{\textbf{5}}$ cases.
```


Note that there cannot be $2$ diameters since there would be one person on either side that will not have a pair adjacent to them. The only scenario forced is when the two people on either side would be paired up across a diameter. Thus, a contradiction will arise.

Case 3: $3$ diameters

There are $5$ possible sets of $3$ diameters to draw.
Notice we are technically choosing the number of ways to choose a pair of two diameters that are neighbors to each other. This means we can choose the first diameter in the pair, and have only two diameters to choose from for the second in the pair. This means we have $5 \cdot 2=10$ possibilities for choosing 5 neighboring diameters. However, notice that there are duplicates, so we divide the $10$ possibilities by $2$ to get $\boxed{\textbf{5}}$.

Note that there cannot be a case with $4$ diameters because then there would have to be $5$ diameters for the two remaining people as they have to be connected with a diameter. A contradiction arises.

Case 4: $5$ diameters

There is only $\boxed{\textbf{1}}$ way to do this.

Thus, in total there are $\boxed{\textbf{(C) }13}$ possible ways.


*~Pearl2008 + Alzwang (Minor Edits)*
## Video Solution (HOW TO THINK CRITICALLY!!!)
https://youtu.be/t1WQTZ8TF7k

*~Education, the Study of Everything*
## Video Solution by TheBeautyOfMath
https://youtu.be/3BvJeZU3T-M?t=419

https://youtu.be/0xgTR3UEqbQ
## Video Solution by Sohil Rathi
https://youtu.be/0W3VmFp55cM?t=2796
## See Also
