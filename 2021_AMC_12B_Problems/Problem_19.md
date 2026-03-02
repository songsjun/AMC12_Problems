# 2021 AMC 12B Problem 19

## Problem
Two fair dice, each with at least 6 faces are rolled. On each face of each die is printed a distinct integer from 1 to the number of faces on that die, inclusive. The probability of rolling a sum of 7 is $\frac34$ of the probability of rolling a sum of 10, and the probability of rolling a sum of 12 is $\frac{1}{12}.$ What is the least possible number of faces on the two dice combined?

$\textbf{(A) }16 \qquad \textbf{(B) }17 \qquad \textbf{(C) }18\qquad \textbf{(D) }19 \qquad \textbf{(E) }20$
## Solution 1
Suppose the dice have a and b faces, and WLOG $a\geq{b}.$ Since each die has at least 6 faces, there will always be 6 ways to sum to 7. As a result, there must be $\tfrac{4}{3}\cdot6=8$ ways to sum to 10. There are at most nine distinct ways to get a sum of 10, which are possible whenever a,b$\geq{9}.$ To achieve exactly eight ways, b must have 8 faces, and $a\geq9.$ Let n be the number of ways to obtain a sum of 12, then $\tfrac{n}{8a}=\tfrac{1}{12}\impliesn=\tfrac{2}{3}$a. Since $b=8, n\leq8\impliesa\leq{12}.$ In addition to 3\mid{a}, we only have to test $a=9$,12, of which both work. Taking the smaller one, our answer becomes $a+b=9+8=\boxed{\textbf{(B)}\ 17}.$
## Solution 2
Suppose the dice have a and b faces, and WLOG $a\geq{b}.$ Note that if a+$b=12$ since they are both 6, there is one way to make 12, and incrementing a or b by one will add another way. This gives us the probability of making a 12 as
$$\frac{a+b-11}{ab}=\frac{1}{12}$$
Cross-multiplying, we get
$$12a+12b-132=ab$$
Simon's Favorite Factoring Trick now gives
$$(a-12)(b-12)=12$$
This narrows the possibilities down to 3 ordered pairs of (a,b), which are (13,24), (6,10), and (8,9).  We can obviously ignore the first pair and test the next two straightforwardly.  The last pair yields the answer:
$$\frac{6}{72}=\frac{3}{4}\left(\frac{9+8-9}{72}\right)$$
The answer is then $a+b=8+9=\boxed{\textbf{(B)}\ 17}.$

*~Hyprox1413*
## Solution 3 (Logic)
Notice that

$$
\begin{align*} 7&=1+6 \\ &\ \ \ \ \ \ \ \ \ \vdots \\ &=6+1 \end{align*}
$$

are the only cases that could possibly form 7. In another words, regardless of the number of faces for each dice, 6 is the number of cases that could form a rolling sum of 7.

Because the value of the total combination for both are the same, we could infer that the number of cases of having a rolling sum of 10 is $\frac{4}{3}\cdot6=8.$ With the number 8, we could also deduce that one dice has 8 sides and the other has at least 9 sides. Thence trial and error could be utilized.

Since 9 is the next smallest number, the case could be tested.

$$
\begin{align*} 12&=3+9 \\ &=4+8 \\ &\ \ \ \ \ \ \ \ \ \vdots \\ &=8+4 \end{align*}
$$

$\frac{6}{8\cdot9}=\frac{1}{12}$ is also true. Therefore, $8+9=\boxed{\textbf{(B) }17}$

*~MaPhyCom*
## Solution 4
Let the two dice have at least six faces each, and let their face counts sum to N. We seek the minimum possible N such that p($\text{sum}=12)=\tfrac{1}{12}$ and p($\text{sum}=7)=\tfrac{3}{4}$p($\text{sum}=10).$

First try N=16. Then the possible face-count pairs (m,n) with m $\leq$ n are (6,10), (7,9), (8,8). For p($\text{sum}=12)=\tfrac{1}{12}$ to be possible, the total outcomes mn must be a multiple of 12. But $7\cdot 9=63$ and $8\cdot 8=64$ are not multiples of 12, so (7,9) and (8,8) are impossible.

For (6,10), there are 60 outcomes. The combinations that sum to 12 are (2,10), (3,9), (4,8), (5,7), (6,6), five in total, giving p(12)=$\tfrac{5}{60}=\tfrac{1}{12}.$
The combinations that sum to 10 are (1,9), (2,8), (3,7), (4,6), (5,5), (6,4), six in total, giving p(10)=$\tfrac{6}{60}=\tfrac{1}{10}.$
The combinations that sum to 7 are (1,6), (2,5), (3,4), (4,3), (5,2), (6,1), also six in total, giving p(7)=$\tfrac{6}{60}=\tfrac{1}{10}.$
So p(7)=p(10), which does not satisfy the condition. Hence N=16 is impossible.

Next try N=17. The possible pairs are (6,11), (7,10), (8,9). Again, mn must be a multiple of 12, but $6\cdot 11=66$ and $7\cdot 10=70$ are not; discard these.

For (8,9), there are 72 outcomes.
The combinations that sum to 12 are (3,9), (4,8), (5,7), (6,6), (7,5), (8,4), six in total, so p(12)=$\tfrac{6}{72}=\tfrac{1}{12}.$
The combinations that sum to 10 are (1,9), (2,8), (3,7), (4,6), (5,5), (6,4), (7,3), (8,2), eight in total, so p(10)=$\tfrac{8}{72}=\tfrac{1}{9}.$
The combinations that sum to 7 are (1,6), (2,5), (3,4), (4,3), (5,2), (6,1), six in total, so p(7)=$\tfrac{6}{72}=\tfrac{1}{12}.$

Thus p(12)=$\tfrac{1}{12}$ and p(7)=$\tfrac{1}{12}=\tfrac{3}{4}\cdot\tfrac{1}{9}=\tfrac{3}{4}$p(10).

Therefore N=17 works, and since N=16 is impossible, the minimum is $\boxed{(\textbf{B})\ 17}.$

*~STIDE*
## Video Solution
https://youtu.be/xGp5yQ5Bshs

*~MathProblemSolvingSkills*
## Video Solution by OmegaLearn (Using Probability)
https://youtu.be/geEDrsV5Glw

*~pi_is_3.14*
## See Also
